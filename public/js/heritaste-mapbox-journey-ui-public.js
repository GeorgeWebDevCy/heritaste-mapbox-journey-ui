(function () {
	'use strict';

	function createTextElement(tag, className, text) {
		var element = document.createElement(tag);
		if (className) {
			element.className = className;
		}
		element.textContent = text || '';
		return element;
	}

	// Returns the 11-character video ID for YouTube watch, Shorts, embed and
	// youtu.be links, or an empty string for anything else.
	function getYouTubeId(url) {
		var id = '';
		try {
			var parsed = new URL(url, window.location.href);
			var host = parsed.hostname.replace(/^(www|m)\./, '');
			if (host === 'youtu.be') {
				id = parsed.pathname.split('/')[1] || '';
			} else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
				var pathMatch = parsed.pathname.match(/^\/(?:shorts|embed|live)\/([^/?#]+)/);
				id = parsed.searchParams.get('v') || (pathMatch ? pathMatch[1] : '');
			}
		} catch (error) {
			return '';
		}
		return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : '';
	}

	var videoDialog = null;

	// One shared modal for story videos. The YouTube player loads only when a
	// visitor opens it, and is removed on close so playback stops.
	function getVideoDialog() {
		if (videoDialog) {
			return videoDialog;
		}

		var dialog = document.createElement('dialog');
		var frame = document.createElement('div');
		var closeButton = document.createElement('button');

		dialog.className = 'heritaste-video-dialog';
		frame.className = 'heritaste-video-dialog__frame';
		closeButton.type = 'button';
		closeButton.className = 'heritaste-video-dialog__close';
		closeButton.setAttribute('aria-label', 'Close video');
		closeButton.textContent = '×';
		closeButton.addEventListener('click', function () {
			dialog.close();
		});

		dialog.addEventListener('click', function (event) {
			if (event.target === dialog) {
				dialog.close();
			}
		});
		dialog.addEventListener('close', function () {
			frame.textContent = '';
		});

		dialog.appendChild(closeButton);
		dialog.appendChild(frame);
		document.body.appendChild(dialog);
		videoDialog = { dialog: dialog, frame: frame };

		return videoDialog;
	}

	function openVideoDialog(videoId, title) {
		var video = getVideoDialog();
		var iframe = document.createElement('iframe');

		iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(videoId) + '?autoplay=1&rel=0&playsinline=1';
		iframe.title = title;
		iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
		iframe.allowFullscreen = true;
		iframe.referrerPolicy = 'strict-origin-when-cross-origin';
		video.frame.textContent = '';
		video.frame.appendChild(iframe);
		video.dialog.setAttribute('aria-label', title);

		if (typeof video.dialog.showModal === 'function') {
			video.dialog.showModal();
		} else {
			window.open('https://www.youtube.com/watch?v=' + encodeURIComponent(videoId), '_blank', 'noopener');
		}
	}

	function createAudioCallToAction(stop, journey) {
		var wrapper = document.createElement('div');
		var link = document.createElement('a');
		var icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		var speaker = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		var soundWave = document.createElementNS('http://www.w3.org/2000/svg', 'path');

		wrapper.className = 'heritaste-map-popup__audio-cta';
		link.className = 'heritaste-map-popup__audio-button';
		link.href = stop.audio || '#';
		link.setAttribute('aria-label', 'Listen to the full story: ' + stop.title);

		var videoId = stop.audio ? getYouTubeId(stop.audio) : '';

		if (!stop.audio) {
			link.classList.add('heritaste-map-popup__audio-button--placeholder');
			link.setAttribute('aria-disabled', 'true');
			link.addEventListener('click', function (event) {
				event.preventDefault();
			});
		} else if (videoId) {
			link.setAttribute('aria-haspopup', 'dialog');
			link.addEventListener('click', function (event) {
				event.preventDefault();
				openVideoDialog(videoId, journey.participant.name + ' — ' + stop.title);
			});
		} else {
			link.target = '_blank';
			link.rel = 'noopener noreferrer';
		}

		icon.setAttribute('viewBox', '0 0 64 64');
		icon.setAttribute('aria-hidden', 'true');
		icon.setAttribute('focusable', 'false');
		speaker.setAttribute('d', 'M14 26h10l13-10v32L24 38H14z');
		soundWave.setAttribute('d', 'M43 24c4 4 4 12 0 16M49 18c8 8 8 20 0 28');
		soundWave.setAttribute('fill', 'none');
		soundWave.setAttribute('stroke', 'currentColor');
		soundWave.setAttribute('stroke-width', '5');
		soundWave.setAttribute('stroke-linecap', 'round');
		icon.appendChild(speaker);
		icon.appendChild(soundWave);
		link.appendChild(icon);
		wrapper.appendChild(link);
		wrapper.appendChild(createTextElement('span', 'heritaste-map-popup__audio-prompt', 'Click the icon to listen to the full story'));

		return wrapper;
	}

	function createPopupContent(journey, stop) {
		var content = document.createElement('article');
		content.className = 'heritaste-map-popup';

		if (stop.photo) {
			var image = document.createElement('img');
			image.className = 'heritaste-map-popup__image';
			image.src = stop.photo;
			image.alt = '';
			image.loading = 'lazy';
			content.appendChild(image);
		}

		content.appendChild(createTextElement('h3', 'heritaste-map-popup__title', stop.title));
		content.appendChild(createTextElement('p', 'heritaste-map-popup__participant', journey.participant.name));
		if (journey.participant.age) {
			content.appendChild(createTextElement('p', 'heritaste-map-popup__meta', 'Age ' + journey.participant.age));
		}

		// Each line break from the source content becomes its own paragraph.
		if (stop.story) {
			stop.story.split(/\r?\n+/).forEach(function (paragraph) {
				if (paragraph.trim()) {
					content.appendChild(createTextElement('p', 'heritaste-map-popup__story', paragraph.trim()));
				}
			});
		}


		content.appendChild(createAudioCallToAction(stop, journey));

		if (stop.document) {
			var documentLink = document.createElement('a');
			documentLink.className = 'heritaste-map-popup__document';
			documentLink.href = stop.document;
			documentLink.target = '_blank';
			documentLink.rel = 'noopener noreferrer';
			documentLink.textContent = stop.document_label || 'View supporting document';
			content.appendChild(documentLink);
		}

		return content;
	}

	// A recipe stop is titled as one ("… A Recipe That Reminds Me of Home") or
	// carries a recipe document; some partners supply a dish photo but no PDF.
	function isRecipeStop(stop) {
		return /recipe/i.test(stop.title || '') || (Boolean(stop.document) && /recipe/i.test(stop.document_label || ''));
	}

	function getRoutePosition(coordinates, progress) {
		var lengths = [];
		var totalLength = 0;

		for (var index = 1; index < coordinates.length; index += 1) {
			var longitudeDelta = coordinates[index][0] - coordinates[index - 1][0];
			var latitudeDelta = coordinates[index][1] - coordinates[index - 1][1];
			var length = Math.sqrt((longitudeDelta * longitudeDelta) + (latitudeDelta * latitudeDelta));
			lengths.push(length);
			totalLength += length;
		}

		if (!totalLength) {
			return coordinates[0];
		}

		var remaining = totalLength * Math.max(0, Math.min(1, progress));
		for (var segment = 0; segment < lengths.length; segment += 1) {
			if (remaining <= lengths[segment] && lengths[segment] > 0) {
				var ratio = remaining / lengths[segment];
				return [
					coordinates[segment][0] + ((coordinates[segment + 1][0] - coordinates[segment][0]) * ratio),
					coordinates[segment][1] + ((coordinates[segment + 1][1] - coordinates[segment][1]) * ratio)
				];
			}
			remaining -= lengths[segment];
		}

		return coordinates[coordinates.length - 1];
	}

	function getRouteMidpoint(coordinates) {
		return getRoutePosition(coordinates, 0.5);
	}

	function isDirectNarrativeJourney(coordinates) {
		var uniqueCoordinates = {};
		coordinates.forEach(function (coordinate) {
			uniqueCoordinates[Number(coordinate[0]).toFixed(4) + ',' + Number(coordinate[1]).toFixed(4)] = true;
		});
		return coordinates.length > 2 && Object.keys(uniqueCoordinates).length === 2;
	}

	function createRecipeMarkerIcon() {
		var icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		var plate = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		var plateInner = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		var fork = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		var knife = document.createElementNS('http://www.w3.org/2000/svg', 'path');

		icon.setAttribute('viewBox', '0 0 64 64');
		icon.setAttribute('aria-hidden', 'true');
		icon.setAttribute('focusable', 'false');
		plate.setAttribute('cx', '32');
		plate.setAttribute('cy', '32');
		plate.setAttribute('r', '18');
		plateInner.setAttribute('cx', '32');
		plateInner.setAttribute('cy', '32');
		plateInner.setAttribute('r', '12');
		fork.setAttribute('d', 'M10 12v14m5-14v14m-5-7h5m-2.5 7v26');
		knife.setAttribute('d', 'M51 12c-6 7-7 15-4 21h4v19');
		icon.appendChild(plate);
		icon.appendChild(plateInner);
		icon.appendChild(fork);
		icon.appendChild(knife);

		return icon;
	}

	function getRouteCoordinates(journey) {
		return journey.stops.map(function (stop) {
			return [stop.longitude, stop.latitude];
		});
	}

	// Where each stop's marker is drawn. Recipe and narrative stops sit on the
	// route line; endpoints stay on their true coordinates.
	function getMarkerPlacements(journey) {
		var routeCoordinates = getRouteCoordinates(journey);
		var directNarrativeJourney = isDirectNarrativeJourney(routeCoordinates);

		return journey.stops.map(function (stop, stopIndex) {
			var recipeStop = isRecipeStop(stop);
			var isEndpoint = stopIndex === 0 || stopIndex === journey.stops.length - 1;
			var directNarrativeMarker = directNarrativeJourney && !isEndpoint;
			var coordinate = routeCoordinates[stopIndex];
			var fraction = null;

			if (recipeStop) {
				fraction = 0.5;
				coordinate = getRouteMidpoint(routeCoordinates);
			} else if (directNarrativeMarker) {
				fraction = stopIndex / (journey.stops.length - 1);
				coordinate = getRoutePosition(routeCoordinates, fraction);
			}

			return {
				coordinate: coordinate,
				recipe: recipeStop,
				onRoute: recipeStop || directNarrativeMarker,
				route: routeCoordinates,
				fraction: fraction
			};
		});
	}

	// Land areas (Natural Earth 1:50m, simplified, unnamed; see
	// public/data/README.md). Returns a lookup giving the id of the land area
	// at a coordinate, or -1 over water. Polygon edges are bucketed by 1°
	// latitude bands so each lookup only tests nearby edges.
	function createLandIndex(geojson) {
		var polygons = [];

		(geojson && geojson.features ? geojson.features : []).forEach(function (feature, featureIndex) {
			var geometry = feature.geometry;
			var parts = !geometry ? [] : (geometry.type === 'MultiPolygon' ? geometry.coordinates : (geometry.type === 'Polygon' ? [geometry.coordinates] : []));

			parts.forEach(function (rings) {
				var polygon = { id: featureIndex, minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity, bands: {} };
				rings.forEach(function (ring) {
					for (var current = 0, previous = ring.length - 1; current < ring.length; previous = current, current += 1) {
						var start = ring[previous];
						var end = ring[current];
						polygon.minX = Math.min(polygon.minX, end[0]);
						polygon.maxX = Math.max(polygon.maxX, end[0]);
						polygon.minY = Math.min(polygon.minY, end[1]);
						polygon.maxY = Math.max(polygon.maxY, end[1]);
						for (var band = Math.floor(Math.min(start[1], end[1])); band <= Math.floor(Math.max(start[1], end[1])); band += 1) {
							(polygon.bands[band] = polygon.bands[band] || []).push([start[0], start[1], end[0], end[1]]);
						}
					}
				});
				polygons.push(polygon);
			});
		});

		return function landAt(longitude, latitude) {
			for (var index = 0; index < polygons.length; index += 1) {
				var polygon = polygons[index];
				if (longitude < polygon.minX || longitude > polygon.maxX || latitude < polygon.minY || latitude > polygon.maxY) {
					continue;
				}
				var edges = polygon.bands[Math.floor(latitude)] || [];
				var inside = false;
				for (var edgeIndex = 0; edgeIndex < edges.length; edgeIndex += 1) {
					var edge = edges[edgeIndex];
					if ((edge[1] > latitude) !== (edge[3] > latitude) && longitude < ((edge[2] - edge[0]) * (latitude - edge[1]) / (edge[3] - edge[1])) + edge[0]) {
						inside = !inside;
					}
				}
				if (inside) {
					return polygon.id;
				}
			}
			return -1;
		};
	}

	// Nudges apart pins that overlap on screen, recalculated as the map moves.
	// Overlapping pins push each other away just enough to stay separately
	// clickable while being pulled back towards their true place, so a busy
	// area (e.g. all of Greece at a wide view) stays compact and in roughly the
	// right direction. Once zoomed in far enough, pins sit exactly on their
	// coordinates again.
	function createMarkerSpreader(map, onLayout) {
		var entries = [];
		var frame = 0;
		var minimumGap = 32;
		var iterations = 60;
		var pullBack = 0.04;
		var landAt = null;
		var moving = false;

		function landUnderTip(position, entry) {
			var coordinate = map.unproject([position.x, position.y + entry.headLift]);
			return landAt(coordinate.lng, coordinate.lat);
		}

		function clearOfOthers(candidate, positions, skip) {
			for (var other = 0; other < positions.length; other += 1) {
				if (other === skip) {
					continue;
				}
				var dx = positions[other].x - candidate.x;
				var dy = positions[other].y - candidate.y;
				if ((dx * dx) + (dy * dy) < minimumGap * minimumGap * 0.7) {
					return false;
				}
			}
			return true;
		}

		// A pin that had to move but now points at water or at another area
		// looks for the nearest free spot in its own area (e.g. a Greek pin
		// stays in Greece, never Turkey). Pins whose true place is not inside
		// an outline are left alone.
		function keepOnLand(positions, origins) {
			entries.forEach(function (entry, index) {
				if (entry.landId < 0) {
					return;
				}
				var shiftX = positions[index].x - origins[index].x;
				var shiftY = positions[index].y - origins[index].y;
				if ((Math.abs(shiftX) < 0.5 && Math.abs(shiftY) < 0.5) || landUnderTip(positions[index], entry) === entry.landId) {
					return;
				}

				var best = null;
				var bestDistance = Infinity;
				for (var radius = 6; radius <= 72 && !best; radius += 6) {
					for (var step = 0; step < 12; step += 1) {
						var angle = step * Math.PI / 6;
						var candidate = { x: positions[index].x + (Math.cos(angle) * radius), y: positions[index].y + (Math.sin(angle) * radius) };
						if (!clearOfOthers(candidate, positions, index) || landUnderTip(candidate, entry) !== entry.landId) {
							continue;
						}
						var distance = Math.sqrt(Math.pow(candidate.x - origins[index].x, 2) + Math.pow(candidate.y - origins[index].y, 2));
						if (distance < bestDistance) {
							best = candidate;
							bestDistance = distance;
						}
					}
				}
				if (best) {
					positions[index] = best;
				}
			});
		}

		// Route pins (story and recipe stops) that fall over water slide along
		// their route line to the nearest point on land.
		function moveRoutePinsOntoLand() {
			entries.forEach(function (entry) {
				if (!entry.route || landAt(entry.lngLat[0], entry.lngLat[1]) >= 0) {
					return;
				}
				for (var step = 1; step <= 40; step += 1) {
					var found = null;
					[-1, 1].some(function (direction) {
						var fraction = entry.fraction + (direction * step * 0.01);
						if (fraction <= 0.03 || fraction >= 0.97) {
							return false;
						}
						var point = getRoutePosition(entry.route, fraction);
						if (landAt(point[0], point[1]) >= 0) {
							found = point;
							return true;
						}
						return false;
					});
					if (found) {
						entry.lngLat = found;
						entry.marker.setLngLat(found);
						break;
					}
				}
			});
		}

		function layout() {
			frame = 0;
			// Compare the visible heads of the pins: location pins hang above
			// their tip, recipe plates are centred on their point.
			var origins = entries.map(function (entry) {
				var point = map.project(entry.lngLat);
				return { x: point.x, y: point.y - entry.headLift };
			});
			var positions = origins.map(function (point) {
				return { x: point.x, y: point.y };
			});

			for (var step = 0; step < iterations; step += 1) {
				var moved = false;
				for (var first = 0; first < positions.length; first += 1) {
					for (var second = first + 1; second < positions.length; second += 1) {
						var dx = positions[second].x - positions[first].x;
						var dy = positions[second].y - positions[first].y;
						var distance = Math.sqrt((dx * dx) + (dy * dy));
						if (distance >= minimumGap) {
							continue;
						}
						if (distance < 0.01) {
							// Identical points: separate them in a stable direction.
							var angle = (first * 2.399963) + second;
							dx = Math.cos(angle);
							dy = Math.sin(angle);
							distance = 1;
						} else {
							dx /= distance;
							dy /= distance;
						}
						var push = (minimumGap - Math.max(distance, 0)) / 2;
						positions[first].x -= dx * push;
						positions[first].y -= dy * push;
						positions[second].x += dx * push;
						positions[second].y += dy * push;
						moved = true;
					}
				}
				positions.forEach(function (position, index) {
					position.x += (origins[index].x - position.x) * pullBack;
					position.y += (origins[index].y - position.y) * pullBack;
				});
				if (!moved) {
					break;
				}
			}

			if (landAt && !moving) {
				keepOnLand(positions, origins);
			}

			// Only pins inside the visible map count towards "crowded".
			var canvas = map.getContainer();
			var largestShift = 0;
			entries.forEach(function (entry, index) {
				var offsetX = positions[index].x - origins[index].x;
				var offsetY = positions[index].y - origins[index].y;
				var onScreen = origins[index].x >= 0 && origins[index].y >= 0 && origins[index].x <= canvas.clientWidth && origins[index].y <= canvas.clientHeight;
				if (onScreen) {
					largestShift = Math.max(largestShift, Math.sqrt((offsetX * offsetX) + (offsetY * offsetY)));
				}
				if (Math.abs(offsetX) < 0.5 && Math.abs(offsetY) < 0.5) {
					entry.marker.setOffset([0, 0]);
				} else {
					entry.marker.setOffset([offsetX, offsetY]);
				}
			});

			if (onLayout) {
				onLayout(largestShift);
			}
		}

		function schedule() {
			if (!frame) {
				frame = window.requestAnimationFrame(layout);
			}
		}

		map.on('move', schedule);
		map.on('resize', schedule);
		// Land checks run once the map settles, keeping movement smooth.
		map.on('movestart', function () {
			moving = true;
		});
		map.on('moveend', function () {
			moving = false;
			schedule();
		});

		return {
			add: function (marker, lngLat, headLift, route, fraction) {
				entries.push({ marker: marker, lngLat: lngLat, headLift: headLift || 0, route: route || null, fraction: fraction, landId: -1 });
			},
			setLand: function (lookup) {
				landAt = lookup;
				moveRoutePinsOntoLand();
				entries.forEach(function (entry) {
					entry.landId = landAt(entry.lngLat[0], entry.lngLat[1]);
				});
				schedule();
			},
			update: schedule
		};
	}

	// Journeys sharing a colour (e.g. one origin country) share one line offset
	// so their identical routes draw as a single line.
	// Journeys that follow the same route (e.g. everyone from Nepal to Cyprus)
	// are drawn as parallel lines 6px apart, so each participant keeps
	// a visible line of their own while sharing their origin country's colour.
	function buildRouteOffsets(journeys) {
		var spacing = 6;
		var groups = {};

		journeys.forEach(function (journey) {
			var routeKey = getRouteCoordinates(journey).map(function (coordinate) {
				return Number(coordinate[0]).toFixed(2) + ',' + Number(coordinate[1]).toFixed(2);
			}).join(';');
			(groups[routeKey] = groups[routeKey] || []).push(journey.id);
		});

		var offsets = {};
		Object.keys(groups).forEach(function (routeKey) {
			var ids = groups[routeKey];
			ids.forEach(function (id, position) {
				offsets[id] = (position - ((ids.length - 1) / 2)) * spacing;
			});
		});

		return offsets;
	}

	function addJourney(map, journey, bounds, index, routeOffset, markerSpreader, addMarkers) {
		var routeCoordinates = getRouteCoordinates(journey);
		var placements = getMarkerPlacements(journey);

		routeCoordinates.forEach(function (coordinate) {
			bounds.extend(coordinate);
		});

		if (routeCoordinates.length > 1) {
			var sourceId = 'heritaste-route-' + journey.id + '-' + index;
			if (!map.getSource(sourceId)) {
				map.addSource(sourceId, {
					type: 'geojson',
					data: {
						type: 'Feature',
						properties: { participant: journey.participant.name },
						geometry: { type: 'LineString', coordinates: routeCoordinates }
					}
				});
			}

			// A light casing under each route keeps it readable over satellite
			// imagery and dark map styles.
			if (!map.getLayer(sourceId + '-casing')) {
				map.addLayer({
					id: sourceId + '-casing',
					type: 'line',
					source: sourceId,
					layout: { 'line-cap': 'round', 'line-join': 'round' },
					paint: {
						'line-color': '#fffaf2',
						'line-width': 6.5,
						'line-opacity': 0.9,
						'line-offset': routeOffset
					}
				});
			}

			if (!map.getLayer(sourceId)) {
				map.addLayer({
					id: sourceId,
					type: 'line',
					source: sourceId,
					layout: { 'line-cap': 'round', 'line-join': 'round' },
					paint: {
						'line-color': journey.color,
						'line-width': 3.5,
						'line-opacity': 0.95,
						'line-offset': routeOffset
					}
				});
			}
		}

		if (!addMarkers) {
			return;
		}

		journey.stops.forEach(function (stop, stopIndex) {
			var marker = document.createElement('button');
			var placement = placements[stopIndex];
			var recipeStop = placement.recipe;
			var stopType = recipeStop ? 'recipe' : (stopIndex === 0 ? 'start' : (stopIndex === journey.stops.length - 1 ? 'end' : 'stop'));
			var markerCoordinate = placement.coordinate;
			marker.type = 'button';
			marker.className = 'heritaste-map-marker heritaste-map-marker--' + stopType;
			marker.style.setProperty('--heritaste-marker-color', journey.color);
			marker.setAttribute('aria-label', journey.participant.name + ' — ' + (stopType === 'start' ? 'Origin' : (stopType === 'end' ? 'Destination' : (stopType === 'recipe' ? 'Recipe' : 'Stop'))) + ': ' + stop.title);
			if (stopType === 'start') {
				// Shown by CSS on hover/focus; the popup still opens only on click.
				marker.appendChild(createTextElement('span', 'heritaste-map-marker__name', journey.participant.name));
			} else {
				marker.setAttribute('title', stop.title);
			}
			if (recipeStop) {
				marker.appendChild(createRecipeMarkerIcon());
			}

			// Mapbox would focus the first button in the panel (the listen button
			// near the bottom), scrolling past the photo and title. Focus the
			// close button at the top instead and start the panel scrolled up.
			var popup = new mapboxgl.Popup({ offset: 20, closeButton: true, focusAfterOpen: false, maxWidth: window.innerWidth <= 600 ? 'calc(100vw - 32px)' : '480px' })
				.setDOMContent(createPopupContent(journey, stop));
			popup.on('open', function () {
				var element = popup.getElement();
				var content = element ? element.querySelector('.mapboxgl-popup-content') : null;
				var closeButton = element ? element.querySelector('.mapboxgl-popup-close-button') : null;
				if (content) {
					content.scrollTop = 0;
				}
				if (closeButton) {
					closeButton.setAttribute('aria-label', 'Close story panel');
					closeButton.focus({ preventScroll: true });
				}
			});
			markerSpreader.add(new mapboxgl.Marker({ element: marker, anchor: recipeStop ? 'center' : 'bottom' })
				.setLngLat(markerCoordinate)
				.setPopup(popup)
				.addTo(map), markerCoordinate, recipeStop ? 0 : 14, placement.onRoute ? placement.route : null, placement.fraction);
		});
	}

	function getInitialMapPadding(container) {
		var legend = container.parentElement ? container.parentElement.querySelector('.heritaste-map-legend') : null;
		var legendRect = legend ? legend.getBoundingClientRect() : { width: 0, height: 0 };
		var isNarrow = container.clientWidth <= 600;

		if (isNarrow) {
			return {
				top: 88,
				right: 48,
				bottom: Math.min(Math.round(legendRect.height + 32), Math.round(container.clientHeight * 0.42)),
				left: 32
			};
		}

		// The legend sits in the bottom-left corner, so reserve space below the
		// routes rather than a full-height column; journeys run mostly
		// east-west, so this lets the first view zoom in further.
		return {
			top: 110,
			right: 72,
			bottom: Math.min(Math.round(legendRect.height + 40), Math.round(container.clientHeight * 0.5)),
			left: 56
		};
	}

	function fitMapToJourneyData(map, bounds, container) {
		if (bounds.isEmpty()) {
			return;
		}

		map.resize();
		map.fitBounds(bounds, {
			padding: getInitialMapPadding(container),
			maxZoom: 5,
			duration: 0
		});
	}

	function initializeMap(container) {
		var payloadElement = document.getElementById(container.getAttribute('data-payload-id'));
		if (!payloadElement) {
			return;
		}

		var payload;
		var styleSelector = container.parentElement ? container.parentElement.querySelector('[data-map-style-selector]') : null;
		var zoomHint = container.parentElement ? container.parentElement.querySelector('[data-zoom-hint]') : null;
		var zoomHintDismissed = false;

		// Shows the "places are close together" tip only while pins have to be
		// pushed apart to stay clickable; it hides once zoomed in far enough.
		function updateZoomHint(largestShift) {
			if (zoomHint) {
				zoomHint.hidden = zoomHintDismissed || largestShift < 8;
			}
		}

		if (zoomHint) {
			var zoomHintClose = zoomHint.querySelector('[data-zoom-hint-close]');
			if (zoomHintClose) {
				zoomHintClose.addEventListener('click', function () {
					zoomHintDismissed = true;
					zoomHint.hidden = true;
				});
			}
		}
		try {
			payload = JSON.parse(payloadElement.textContent);
		} catch (error) {
			container.textContent = 'The journey data could not be loaded.';
			return;
		}

		mapboxgl.accessToken = heritasteJourneyMap.accessToken;
		var map = new mapboxgl.Map({
			container: container,
			style: heritasteJourneyMap.style,
			center: [20, 20],
			zoom: 1.25,
			projection: 'globe'
		});

		map.addControl(new mapboxgl.NavigationControl({ showCompass: false, visualizePitch: false }), 'top-right');
		map.scrollZoom.disable();

		map.on('load', function () {
			var bounds = new mapboxgl.LngLatBounds();
			var markerSpreader = createMarkerSpreader(map, updateZoomHint);
			var routeOffsets = buildRouteOffsets(payload.journeys);
			payload.journeys.forEach(function (journey, index) {
				addJourney(map, journey, bounds, index, routeOffsets[journey.id], markerSpreader, true);
			});

			window.requestAnimationFrame(function () {
				fitMapToJourneyData(map, bounds, container);
				markerSpreader.update();
			});

			// Optional: without the land outline pins simply stay where the
			// spreading puts them.
			if (heritasteJourneyMap.landMaskUrl && window.fetch) {
				window.fetch(heritasteJourneyMap.landMaskUrl)
					.then(function (response) {
						return response.ok ? response.json() : null;
					})
					.then(function (data) {
						if (data) {
							markerSpreader.setLand(createLandIndex(data));
						}
					})
					.catch(function () {});
			}

			if (styleSelector) {
				styleSelector.addEventListener('change', function () {
					var nextStyle = styleSelector.value;
					styleSelector.disabled = true;
					map.once('style.load', function () {
						payload.journeys.forEach(function (journey, index) {
							addJourney(map, journey, bounds, index, routeOffsets[journey.id], markerSpreader, false);
						});
						container.setAttribute('data-active-map-style', nextStyle);
						styleSelector.disabled = false;
					});
					map.setStyle(nextStyle);
				});
			}
		});

		map.on('error', function () {
			container.classList.add('heritaste-journey-map__canvas--error');
		});
	}

	document.addEventListener('DOMContentLoaded', function () {
		document.querySelectorAll('[data-journey-map]').forEach(initializeMap);
	});
})();
