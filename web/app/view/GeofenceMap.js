/*
 * Copyright 2016 Anton Tananaev (anton.tananaev@gmail.com)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

Ext.define('Traccar.view.GeofenceMap', {
    extend: 'Traccar.view.BaseMap',
    xtype: 'geofenceMapView',

    requires: [
        'Traccar.view.GeofenceMapController',
        'Traccar.GeofenceConverter'
    ],

    controller: 'geofenceMap',
    bodyBorder: true,

    tbar: {
        items: [{
            xtype: 'combobox',
            store: 'GeofenceTypes',
            valueField: 'key',
            displayField: 'name',
            listeners: {
                select: 'onTypeSelect'
            }
        }, {
            xtype: 'tbfill'
        }, {
            text: Strings.sharedSave,
            handler: 'onSaveClick'
        }, {
            text: Strings.sharedCancel,
            handler: 'onCancelClick'
        }]
    },

    getFeatures: function () {
        return this.features;
    },

    initMap: function () {
        var map, featureOverlay, geometry;
        this.callParent();

        map = this.map;

        this.features = new ol.Collection();
        if (this.area !== '') {
            geometry = Traccar.GeofenceConverter.wktToGeometry(this.mapView, this.area);
            this.features.push(new ol.Feature(geometry));
            if (geometry instanceof ol.geom.Circle) {
                this.mapView.setCenter(geometry.getCenter());
            } else if (geometry instanceof ol.geom.Polygon) {
                this.mapView.setCenter(geometry.getCoordinates()[0][0]);
            }
        }
        featureOverlay = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: this.features
            }),
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: Traccar.Style.mapGeofenceOverlay
                }),
                stroke: new ol.style.Stroke({
                    color: Traccar.Style.mapGeofenceColor,
                    width: Traccar.Style.mapGeofenceWidth
                }),
                image: new ol.style.Circle({
                    radius: Traccar.Style.mapGeofenceRadius,
                    fill: new ol.style.Fill({
                        color: Traccar.Style.mapGeofenceColor
                    })
                })
            })
        });
        featureOverlay.setMap(map);

        map.addInteraction(new ol.interaction.Modify({
            features: this.features,
            deleteCondition: function (event) {
                return ol.events.condition.shiftKeyOnly(event) && ol.events.condition.singleClick(event);
            }
        }));
    },

    addInteraction: function (type) {
        this.draw = new ol.interaction.Draw({
            features: this.features,
            type: type
        });
        this.draw.on('drawstart', function () {
            this.features.clear();
        }, this);
        this.map.addInteraction(this.draw);
    },

    removeInteraction: function () {
        if (this.draw) {
            this.map.removeInteraction(this.draw);
            this.draw = null;
        }
    }
});
