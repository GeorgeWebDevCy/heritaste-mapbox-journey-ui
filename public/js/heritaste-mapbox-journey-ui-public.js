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

		return content;
	}

	function addJourney(map, journey, bounds, index) {
		var coordinates = journey.stops.map(function (stop) {
			return [stop.longitude, stop.latitude];
		});

		coordinates.forEach(function (coordinate) {
			bounds.extend(coordinate);
		});

		if (coordinates.length > 1) {
			var sourceId = 'heritaste-route-' + journey.id + '-' + index;
			map.addSource(sourceId, {
				type: 'geojson',
				data: {
					type: 'Feature',
					properties: { participant: journey.participant.name },
					geometry: { type: 'LineString', coordinates: coordinates }
				}
			});

			map.addLayer({
				id: sourceId,
				type: 'line',
				source: sourceId,
				layout: { 'line-cap': 'round', 'line-join': 'round' },
				paint: {
					'line-color': journey.color,
					'line-width': 4,
					'line-opacity': 0.82
				}
			});
		}

		journey.stops.forEach(function (stop, stopIndex) {
			var marker = document.createElement('button');
			marker.type = 'button';
			marker.className = 'heritaste-map-marker';
			marker.style.setProperty('--heritaste-marker-color', journey.color);
			marker.setAttribute('aria-label', journey.participant.name + ': ' + stop.title);
			marker.textContent = String(stopIndex + 1);

			var popup = new mapboxgl.Popup({ offset: 20, closeButton: true, maxWidth: '320px' })
				.setDOMContent(createPopupContent(journey, stop));
			var mapMarker = new mapboxgl.Marker({ element: marker, anchor: 'center' })
				.setLngLat([stop.longitude, stop.latitude])
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

	function initializeMap(container) {
		var payloadElement = document.getElementById(container.getAttribute('data-payload-id'));
		if (!payloadElement) {
			return;
		}

		var payload;
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

		map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
		map.scrollZoom.disable();

		map.on('load', function () {
			var bounds = new mapboxgl.LngLatBounds();
			payload.journeys.forEach(function (journey, index) {
				addJourney(map, journey, bounds, index);
			});

			if (!bounds.isEmpty()) {
				map.fitBounds(bounds, { padding: 56, maxZoom: 5, duration: 0 });
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
