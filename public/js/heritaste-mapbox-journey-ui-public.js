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

	function createAudioCallToAction(stop) {
		var wrapper = document.createElement('div');
		var link = document.createElement('a');
		var icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		var speaker = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		var soundWave = document.createElementNS('http://www.w3.org/2000/svg', 'path');

		wrapper.className = 'heritaste-map-popup__audio-cta';
		link.className = 'heritaste-map-popup__audio-button';
		link.href = stop.audio || '#';
		link.setAttribute('aria-label', 'Listen to the full story: ' + stop.title);

		if (!stop.audio) {
			link.classList.add('heritaste-map-popup__audio-button--placeholder');
			link.setAttribute('aria-disabled', 'true');
			link.addEventListener('click', function (event) {
				event.preventDefault();
			});
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


		content.appendChild(createAudioCallToAction(stop));

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

	function buildMarkerOffsets(journeys) {
		var endpointGroups = [];
		var offsets = {};

		journeys.forEach(function (journey) {
			offsets[journey.id] = journey.stops.map(function () {
				return [0, 0];
			});

			journey.stops.forEach(function (stop, stopIndex) {
				if (stopIndex !== 0 && stopIndex !== journey.stops.length - 1) {
					return;
				}

				var longitude = Number(stop.longitude);
				var latitude = Number(stop.latitude);
				var group = endpointGroups.find(function (candidate) {
					return Math.abs(candidate.longitude - longitude) <= 5 && Math.abs(candidate.latitude - latitude) <= 5;
				});

				if (!group) {
					group = { longitude: longitude, latitude: latitude, endpoints: [] };
					endpointGroups.push(group);
				}

				group.endpoints.push({ journeyId: journey.id, stopIndex: stopIndex });
			});
		});

		endpointGroups.forEach(function (group) {
			if (group.endpoints.length < 2) {
				return;
			}

			group.endpoints.forEach(function (endpoint, occurrence) {
				var angle = Math.PI * 2 * occurrence / group.endpoints.length;
				var radius = 16;
				offsets[endpoint.journeyId][endpoint.stopIndex] = [
					Math.cos(angle) * radius,
					Math.sin(angle) * radius
				];
			});
		});

		return offsets;
	}

	function addJourney(map, journey, bounds, index, totalJourneys, markerOffsets, addMarkers) {
		var routeCoordinates = journey.stops.map(function (stop) {
			return [stop.longitude, stop.latitude];
		});
		var journeyMarkerOffsets = markerOffsets[journey.id] || [];
		var directNarrativeJourney = isDirectNarrativeJourney(routeCoordinates);

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

			if (!map.getLayer(sourceId)) {
				map.addLayer({
					id: sourceId,
					type: 'line',
					source: sourceId,
					layout: { 'line-cap': 'round', 'line-join': 'round' },
					paint: {
						'line-color': journey.color,
						'line-width': 3,
						'line-opacity': 0.88,
						'line-offset': (index - ((totalJourneys - 1) / 2)) * 2
					}
				});
			}
		}

		if (!addMarkers) {
			return;
		}

		journey.stops.forEach(function (stop, stopIndex) {
			var marker = document.createElement('button');
			var recipeStop = isRecipeStop(stop);
			var stopType = recipeStop ? 'recipe' : (stopIndex === 0 ? 'start' : (stopIndex === journey.stops.length - 1 ? 'end' : 'stop'));
			var markerCoordinate = routeCoordinates[stopIndex];
			if (recipeStop) {
				markerCoordinate = getRouteMidpoint(routeCoordinates);
			} else if (directNarrativeJourney && stopIndex > 0 && stopIndex < journey.stops.length - 1) {
				markerCoordinate = getRoutePosition(routeCoordinates, stopIndex / (journey.stops.length - 1));
			}
			var directNarrativeMarker = directNarrativeJourney && stopIndex > 0 && stopIndex < journey.stops.length - 1;
			var markerOffset = (recipeStop || directNarrativeMarker) ? [0, 0] : (journeyMarkerOffsets[stopIndex] || [0, 0]);
			marker.type = 'button';
			marker.className = 'heritaste-map-marker heritaste-map-marker--' + stopType;
			marker.style.setProperty('--heritaste-marker-color', journey.color);
			marker.setAttribute('aria-label', journey.participant.name + ' — ' + (stopType === 'start' ? 'Origin' : (stopType === 'end' ? 'Destination' : (stopType === 'recipe' ? 'Recipe' : 'Stop'))) + ': ' + stop.title);
			marker.setAttribute('title', stop.title);
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

		return {
			top: 72,
			right: 72,
			bottom: 56,
			left: Math.min(Math.round(legendRect.width + 56), Math.round(container.clientWidth * 0.34))
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
			payload.journeys.forEach(function (journey, index) {
				addJourney(map, journey, bounds, index, payload.journeys.length, markerOffsets, true);
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
							addJourney(map, journey, bounds, index, payload.journeys.length, markerOffsets, false);
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
