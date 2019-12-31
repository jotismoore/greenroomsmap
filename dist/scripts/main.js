
/*
 * Created by jotismoore on 01/07/2019.
 */

var defaultPlaces;

$(function() {
    handleClientLoad();
});

function triggerMarkerEvents(index) {
    google.maps.event.trigger(greenroomsmarkers[index], 'click');
}

function launchMapPlacements(places) {
    defaultPlaces = places;

    var center = { lat: 52.3594635, lng: -1.6668212 };

    if (window.innerWidth < 668) {
        center = { lat: 52.3594635, lng: -1.3668212 };
    }

    // Snazzy Map Style - https://snazzymaps.com/style/8097/wy
    var mapStyle = [{'featureType': 'all', 'elementType': 'geometry.fill', 'stylers': [{'weight': '2.00'}]}, {'featureType': 'all', 'elementType': 'geometry.stroke', 'stylers': [{'color': '#9c9c9c'}]}, {'featureType': 'all', 'elementType': 'labels.text', 'stylers': [{'visibility': 'on'}]}, {'featureType': 'landscape', 'elementType': 'all', 'stylers': [{'color': '#f2f2f2'}]}, {'featureType': 'landscape', 'elementType': 'geometry.fill', 'stylers': [{'color': '#ffffff'}]}, {'featureType': 'landscape.man_made', 'elementType': 'geometry.fill', 'stylers': [{'color': '#ffffff'}]}, {'featureType': 'poi', 'elementType': 'all', 'stylers': [{'visibility': 'off'}]}, {'featureType': 'road', 'elementType': 'all', 'stylers': [{'saturation': -100}, {'lightness': 45}]}, {'featureType': 'road', 'elementType': 'geometry.fill', 'stylers': [{'color': '#eeeeee'}]}, {'featureType': 'road', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#7b7b7b'}]}, {'featureType': 'road', 'elementType': 'labels.text.stroke', 'stylers': [{'color': '#ffffff'}]}, {'featureType': 'road.highway', 'elementType': 'all', 'stylers': [{'visibility': 'simplified'}]}, {'featureType': 'road.arterial', 'elementType': 'labels.icon', 'stylers': [{'visibility': 'off'}]}, {'featureType': 'transit', 'elementType': 'all', 'stylers': [{'visibility': 'off'}]}, {'featureType': 'water', 'elementType': 'all', 'stylers': [{'color': '#46bcec'}, {'visibility': 'on'}]}, {'featureType': 'water', 'elementType': 'geometry.fill', 'stylers': [{'color': '#c8d7d4'}]}, {'featureType': 'water', 'elementType': 'labels.text.fill', 'stylers': [{'color': '#070707'}]}, {'featureType': 'water', 'elementType': 'labels.text.stroke', 'stylers': [{'color': '#ffffff'}]}];

    // Create the map
    var map = new google.maps.Map($('.map-canvas')[0], {
        zoom: 7,
        styles: mapStyle,
        center: center
    });

    initPlaces(places, map);

    var searchButton = document.querySelector('.greenrooms__container__search__close'),
        clearSearch = document.querySelector('.greenrooms__container__search__clear-search');

    function switchClass(event) {
        if (event.path[1].classList.contains('drawer')) {
            event.path[1].classList.remove('drawer');
        } else {
            event.path[1].classList.add('drawer');
        }
    }

    function clearSearchFunction(event) {
        searchButton.removeEventListener('click', switchClass);
        clearSearch.removeEventListener('click', clearSearchFunction);
        launchMapPlacements(defaultPlaces);
    }

    searchButton.addEventListener('click', switchClass, false);
    clearSearch.addEventListener('click', clearSearchFunction, false);

    var input = document.querySelector('.greenrooms__container__search__input');
    var options = {
        componentRestrictions: {country: 'uk'}
    };
    var searchBox = new google.maps.places.SearchBox(input, options);

    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    searchBox.addListener('places_changed', function() {
        var areas = searchBox.getPlaces();

        if (areas.length == 0) {
            return;
        }

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        areas.forEach(function(area) {
            if (!area.geometry) {
                console.error("Returned place contains no geometry");
                return;
            }

            if (area.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(area.geometry.viewport);
            } else {
                bounds.extend(area.geometry.location);
            }

            filterPlaces(defaultPlaces, bounds, map);
        });
        map.fitBounds(bounds);
    });
}

function initPlaces(places, map) {

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
    var widthOverwrite = window.innerWidth > 667 ? 100 : 0;
    window.greenroomsmarkers = [];
    var mark = 0;

    var lookup = places.reduce(function(a, e) {
        if (!a[e.Town]) {
            a[e.Town] = [];
        }
        a[e.Town].push(e);
        return a;
    }, {});

    var keys = [];

    for (var k in lookup) {
        if (lookup.hasOwnProperty(k)) {
            keys.push(k);
        }
    }
    keys.sort();

    var shopList = Handlebars.compile($('#new-shop-template').html());
    var fullList = "";
    $.each(keys, function(j, t) {
        if (!!t) {
            lookup[t].sort(function (a, b) {
                return a.Name.toLowerCase().localeCompare(b.Name.toLowerCase());
            });
            $.each(lookup[t], function (i, e) {
                if (e.Long && e.Lat) {
                    var marker = new google.maps.Marker({
                        map: map,
                        icon: markerIcon,
                        position: new google.maps.LatLng(e.Lat, e.Long)
                    });
                    greenroomsmarkers.push(marker);
                    var random = Math.floor(Math.random() * 10000);
                    e.Marker = mark++;
                    var info = new SnazzyInfoWindow($.extend({}, {
                        marker: marker,
                        placement: 'top',
                        panOnOpen: true,
                        closeWhenOthersOpen: true,
                        wrapperClass: 'custom-window',
                        edgeOffset: {
                            top: 100,
                            right: widthOverwrite,
                            bottom: 0,
                            left: widthOverwrite
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
                            open: function () {
                                $(this.getWrapper()).addClass('open');
                            },
                            afterOpen: function () {
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
                            beforeClose: function () {
                                if (!closeDelayed) {
                                    closeDelayHandler();
                                    return false;
                                }
                                return true;
                            },
                            afterClose: function () {
                                var wrapper = $(this.getWrapper());
                                wrapper.find('.custom-close').off();
                                wrapper.removeClass('open');
                                closeDelayed = false;
                            }
                        }
                    }));
                }

                var closeDelayed = false;
                var closeDelayHandler = function () {
                    $(info.getWrapper()).removeClass('active');
                    setTimeout(function () {
                        closeDelayed = true;
                        info.close();
                    }, 300);
                };
            });
            fullList += shopList({
                town: t,
                objects: lookup[t]
            });
        }
    });

    document.querySelector('.greenrooms__container__search__new').innerHTML = fullList;
}

function filterPlaces(places, bounds, map) {
    var searchedPlaces = places.filter(function(e) {
        return (e.Long > bounds['ka'].g && e.Long < bounds['ka'].h) && (e.Lat > bounds['pa'].g && e.Lat < bounds['pa'].h);
    });
    $('.custom-window').removeClass('active');
    initPlaces(searchedPlaces, map);
}