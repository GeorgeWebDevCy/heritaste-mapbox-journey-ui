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

		if (stop.story) {
			content.appendChild(createTextElement('p', 'heritaste-map-popup__story', stop.story));
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

	function isRecipeStop(stop) {
		return Boolean(stop.document) && /recipe/i.test((stop.document_label || '') + ' ' + (stop.title || ''));
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

			if (recipeStop) {
				coordinate = getRouteMidpoint(routeCoordinates);
			} else if (directNarrativeMarker) {
				coordinate = getRoutePosition(routeCoordinates, stopIndex / (journey.stops.length - 1));
			}

			return {
				coordinate: coordinate,
				recipe: recipeStop,
				onRoute: recipeStop || directNarrativeMarker
			};
		});
	}

	function buildMarkerOffsets(journeys) {
		var markerGroups = [];
		var offsets = {};

		journeys.forEach(function (journey) {
			var placements = getMarkerPlacements(journey);
			offsets[journey.id] = journey.stops.map(function () {
				return [0, 0];
			});

			placements.forEach(function (placement, stopIndex) {
				var isEndpoint = stopIndex === 0 || stopIndex === journey.stops.length - 1;
				if (!isEndpoint && !placement.onRoute) {
					return;
				}

				// Endpoints group by proximity within a country area; on-route
				// markers only group when journeys share almost the same line.
				var pool = placement.onRoute ? 'route' : 'endpoint';
				var tolerance = placement.onRoute ? 0.5 : 5;
				var longitude = Number(placement.coordinate[0]);
				var latitude = Number(placement.coordinate[1]);
				var group = markerGroups.find(function (candidate) {
					return candidate.pool === pool && Math.abs(candidate.longitude - longitude) <= tolerance && Math.abs(candidate.latitude - latitude) <= tolerance;
				});

				if (!group) {
					group = { pool: pool, longitude: longitude, latitude: latitude, markers: [] };
					markerGroups.push(group);
				}

				group.markers.push({ journeyId: journey.id, stopIndex: stopIndex });
			});
		});

		markerGroups.forEach(function (group) {
			if (group.markers.length < 2) {
				return;
			}

			// Grow the ring with the group size so neighbouring pins stay
			// separately hoverable and clickable.
			var halfSpacing = group.pool === 'route' ? 19 : 15;
			var radius = Math.max(group.pool === 'route' ? 20 : 16, halfSpacing / Math.sin(Math.PI / group.markers.length));
			group.markers.forEach(function (entry, occurrence) {
				var angle = Math.PI * 2 * occurrence / group.markers.length;
				offsets[entry.journeyId][entry.stopIndex] = [
					Math.cos(angle) * radius,
					Math.sin(angle) * radius
				];
			});
		});

		return offsets;
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

	function addJourney(map, journey, bounds, index, routeOffset, markerOffsets, addMarkers) {
		var routeCoordinates = getRouteCoordinates(journey);
		var journeyMarkerOffsets = markerOffsets[journey.id] || [];
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
			var markerOffset = journeyMarkerOffsets[stopIndex] || [0, 0];
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

			var popup = new mapboxgl.Popup({ offset: 20, closeButton: true, maxWidth: window.innerWidth <= 600 ? 'calc(100vw - 32px)' : '480px' })
				.setDOMContent(createPopupContent(journey, stop));
			new mapboxgl.Marker({ element: marker, anchor: recipeStop ? 'center' : 'bottom', offset: markerOffset })
				.setLngLat(markerCoordinate)
				.setPopup(popup)
				.addTo(map);
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
			var markerOffsets = buildMarkerOffsets(payload.journeys);
			var routeOffsets = buildRouteOffsets(payload.journeys);
			payload.journeys.forEach(function (journey, index) {
				addJourney(map, journey, bounds, index, routeOffsets[journey.id], markerOffsets, true);
			});

			window.requestAnimationFrame(function () {
				fitMapToJourneyData(map, bounds, container);
			});

			if (styleSelector) {
				styleSelector.addEventListener('change', function () {
					var nextStyle = styleSelector.value;
					styleSelector.disabled = true;
					map.once('style.load', function () {
						payload.journeys.forEach(function (journey, index) {
							addJourney(map, journey, bounds, index, routeOffsets[journey.id], markerOffsets, false);
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
