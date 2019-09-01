
/*
 * Created by jotismoore on 01/07/2019.
 */

$(function() {
    handleClientLoad();
});

function launchMapPlacements(places) {

    var center = { lat: 52.3594635, lng: -4.3668212 };

    // Snazzy Map Style - https://snazzymaps.com/style/8097/wy
    var mapStyle = [{'featureType': 'all', 'elementType': 'geometry.fill', 'stylers': [{'weight': '2.00'}]}, {'featureType': 'all', 'elementType': 'geometry.stroke', 'stylers': [{'color': '#9c9c9c'}]}, {'featureType': 'all', 'elementType': 'labels.text', 'stylers': [{'visibility': 'on'}]}, {'featureType': 'landscape', 'elementType': 'all', 'stylers': [{'color': '#f2f2f2'}]}, {'featureType': 'landscape', 'elementType': 'geometry.fill', 'stylers': [{'color': '#ffffff'}]}, {'featureType': 'landscape.man_made', 'elementType': 'geometry.fill', 'stylers': [{'color': '#ffffff'}]}, {'featureType': 'poi', 'elementType': 'all', 'stylers': [{'visibility': 'off'}]}, {'featureType': 'road', 'elementType': 'all', 'stylers': [{'saturation': -100}, {'lightness': 45}]}, {'featureType': 'road', 'elementType': 'geometry.fill', 'stylers': [{'color': '#eeeeee'}]}, {'featureType': 'road', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#7b7b7b'}]}, {'featureType': 'road', 'elementType': 'labels.text.stroke', 'stylers': [{'color': '#ffffff'}]}, {'featureType': 'road.highway', 'elementType': 'all', 'stylers': [{'visibility': 'simplified'}]}, {'featureType': 'road.arterial', 'elementType': 'labels.icon', 'stylers': [{'visibility': 'off'}]}, {'featureType': 'transit', 'elementType': 'all', 'stylers': [{'visibility': 'off'}]}, {'featureType': 'water', 'elementType': 'all', 'stylers': [{'color': '#46bcec'}, {'visibility': 'on'}]}, {'featureType': 'water', 'elementType': 'geometry.fill', 'stylers': [{'color': '#c8d7d4'}]}, {'featureType': 'water', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#070707'}]}, {'featureType': 'water', 'elementType': 'labels.text.stroke', 'stylers': [{'color': '#ffffff'}]}];

    // Create the map
    var map = new google.maps.Map($('.map-canvas')[0], {
        zoom: 7,
        styles: mapStyle,
        center: center
    });

    // Add a custom marker
    var markerIcon = {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: '#6e7c7c',
        fillOpacity: 0.95,
        scale: 2,
        strokeColor: '#fff',
        strokeWeight: 3,
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(12, 24)
    };

    var template = Handlebars.compile($('#marker-content-template').html());

    $.each(places, function(i, e) {
        if (e.Long && e.Lat) {
            var marker = new google.maps.Marker({
                map: map,
                icon: markerIcon,
                position: new google.maps.LatLng(e.Lat,e.Long)
            });
            var random = Math.floor(Math.random() * 10000);
            var info = new SnazzyInfoWindow($.extend({}, {
                marker: marker,
                placement: 'top',
                panOnOpen: true,
                wrapperClass: 'custom-window',
                edgeOffset: {
                    top: 100,
                    right: 100,
                    bottom: 0,
                    left: 100
                },
                border: false,
                closeButtonMarkup: '<button type="button" class="custom-close">&#215;</button>',
                content: template({
                    title: e.Name,
                    subtitle: e.Instagram,
                    bgImg: e.Image,
                    address: e.Address,
                    copy: e.Copy,
                    website: e.Website,
                    share: random,
                    lat: e.Lat,
                    long: e.Long
                }),
                callbacks: {
                    open: function() {
                        $('.custom-window').removeClass('active');
                        $(this.getWrapper()).addClass('open');
                    },
                    afterOpen: function() {
                        var wrapper = $(this.getWrapper());
                        wrapper.addClass('active');
                        wrapper.find('.custom-close').on('click', closeDelayHandler);
                        window.__sharethis__.load('inline-share-buttons', {
                            alignment: 'center',
                            id: random + '-inline-share-buttons',
                            enabled: true,
                            networks: ['facebook', 'twitter', 'pinterest', 'email', 'whatsapp'],
                            url: e.Website,
                            username: e.Instagram
                        });
                    },
                    beforeClose: function() {
                        if (!closeDelayed) {
                            closeDelayHandler();
                            return false;
                        }
                        return true;
                    },
                    afterClose: function() {
                        var wrapper = $(this.getWrapper());
                        wrapper.find('.custom-close').off();
                        wrapper.removeClass('open');
                        closeDelayed = false;
                    }
                }
            }));
        }

        var closeDelayed = false;
        var closeDelayHandler = function() {
            $(info.getWrapper()).removeClass('active');
            setTimeout(function() {
                closeDelayed = true;
                info.close();
            }, 300);
        };
    });

    var input = document.getElementById('pac-input');
    var options = {
        componentRestrictions: {country: 'uk'}
    };
    var searchBox = new google.maps.places.SearchBox(input, options);

    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            if (!place.geometry) {
                console.error("Returned place contains no geometry");
                return;
            }

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
}
