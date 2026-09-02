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

		content.appendChild(createTextElement('p', 'heritaste-map-popup__participant', journey.participant.name));
		if (journey.participant.age) {
			content.appendChild(createTextElement('p', 'heritaste-map-popup__meta', 'Age ' + journey.participant.age));
		}
		content.appendChild(createTextElement('h3', 'heritaste-map-popup__title', stop.title));

		if (stop.story) {
			content.appendChild(createTextElement('p', 'heritaste-map-popup__story', stop.story));
		}

		if (stop.audio) {
			var audio = document.createElement('audio');
			audio.controls = true;
			audio.preload = 'none';
			audio.src = stop.audio;
			audio.setAttribute('aria-label', 'Audio for ' + stop.title);
			content.appendChild(audio);
		}

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

	function coordinateKey(stop) {
		return Number(stop.longitude).toFixed(4) + ',' + Number(stop.latitude).toFixed(4);
	}

	function buildDisplayCoordinates(journeys) {
		var occurrences = {};
		var positions = {};

		journeys.forEach(function (journey) {
			journey.stops.forEach(function (stop) {
				var key = coordinateKey(stop);
				occurrences[key] = (occurrences[key] || 0) + 1;
			});
		});

		journeys.forEach(function (journey) {
			positions[journey.id] = journey.stops.map(function (stop) {
				var key = coordinateKey(stop);
				var total = occurrences[key];
				var occurrence = positions[key] || 0;
				positions[key] = occurrence + 1;

				if (total < 2) {
					return [stop.longitude, stop.latitude];
				}

				var angle = (Math.PI * 2 * occurrence / total) - (Math.PI / 2);
				var radius = 2.5;
				return [
					Number(stop.longitude) + (Math.cos(angle) * radius),
					Number(stop.latitude) + (Math.sin(angle) * radius)
				];
			});
		});

		return positions;
	}

	function addJourney(map, journey, bounds, index, totalJourneys, displayCoordinates, addMarkers) {
		var coordinates = displayCoordinates[journey.id] || journey.stops.map(function (stop) {
			return [stop.longitude, stop.latitude];
		});

		coordinates.forEach(function (coordinate) {
			bounds.extend(coordinate);
		});

		if (coordinates.length > 1) {
			var sourceId = 'heritaste-route-' + journey.id + '-' + index;
			if (!map.getSource(sourceId)) {
				map.addSource(sourceId, {
					type: 'geojson',
					data: {
						type: 'Feature',
						properties: { participant: journey.participant.name },
						geometry: { type: 'LineString', coordinates: coordinates }
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
			var stopType = stopIndex === 0 ? 'start' : (stopIndex === journey.stops.length - 1 ? 'end' : 'stop');
			marker.type = 'button';
			marker.className = 'heritaste-map-marker heritaste-map-marker--' + stopType;
			marker.style.setProperty('--heritaste-marker-color', journey.color);
			marker.setAttribute('aria-label', journey.participant.name + ' — ' + (stopType === 'start' ? 'Origin' : (stopType === 'end' ? 'Destination' : 'Stop')) + ': ' + stop.title);
			marker.setAttribute('title', stop.title);

			var popup = new mapboxgl.Popup({ offset: 20, closeButton: true, maxWidth: window.innerWidth <= 600 ? 'calc(100vw - 32px)' : '480px' })
				.setDOMContent(createPopupContent(journey, stop));
			var mapMarker = new mapboxgl.Marker({ element: marker, anchor: 'bottom' })
				.setLngLat(coordinates[stopIndex])
				.setPopup(popup)
				.addTo(map);

			marker.addEventListener('mouseenter', function () {
				if (!popup.isOpen()) {
					mapMarker.togglePopup();
				}
			});
			marker.addEventListener('focus', function () {
				if (!popup.isOpen()) {
					mapMarker.togglePopup();
				}
			});
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
			var displayCoordinates = buildDisplayCoordinates(payload.journeys);
			payload.journeys.forEach(function (journey, index) {
				addJourney(map, journey, bounds, index, payload.journeys.length, displayCoordinates, true);
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
							addJourney(map, journey, bounds, index, payload.journeys.length, displayCoordinates, false);
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
