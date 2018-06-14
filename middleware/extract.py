#!/usr/bin/env python

import urllib
import json as simplejson
from os import system
import os
import time
import json

# Google Maps API URL
api_url = 'https://maps.googleapis.com/maps/api/directions/json?origin=Brooklyn&destination=Queens&mode=transit&key=AIzaSyD_sAu7TZJWzrmMi1SygxEG3Smdp3Ihb0A'
response = urllib.urlopen(api_url)
data = simplejson.load(response)
num_steps = range(len(data['routes'][0]['legs'][0]['steps']))
print num_steps

tripw = {None for x in num_steps}
print tripw

trip = []

for i in num_steps:
    tripLeg={}
    distance = (data['routes'][0]['legs'][0]['steps'][i]['distance']['value'])
    duration = (data['routes'][0]['legs'][0]['steps'][i]['duration']['value'])
    end_location_lat = (data['routes'][0]['legs'][0]['steps'][i]['end_location']['lat'])
    end_location_lng = (data['routes'][0]['legs'][0]['steps'][i]['end_location']['lng'])
    start_location_lat = (data['routes'][0]['legs'][0]['steps'][i]['start_location']['lat'])
    start_location_lng = (data['routes'][0]['legs'][0]['steps'][i]['start_location']['lng'])
    travel_mode = (data['routes'][0]['legs'][0]['steps'][i]['travel_mode'])
    # Output API Information
    print "distance: " + str(distance)
    tripLeg['distance'] = distance
    print "duration: " + str(duration)
    tripLeg['duration'] = duration
    print "start_location_lat: " + str(start_location_lat)
    tripLeg['start_location_lat'] = start_location_lat
    print "start_location_lng: " + str(start_location_lng)
    tripLeg['start_location_lng'] = start_location_lng
    print "end_location_lat: " + str(end_location_lat)
    tripLeg['end_location_lat'] = end_location_lat
    print "end_location_lng: " + str(end_location_lng)
    tripLeg['end_location_lng'] = end_location_lng
    print "travel_mode: " + str(travel_mode)
    tripLeg['travel_mode'] = travel_mode
    print "\n"
    trip.append(tripLeg)

json_data = json.dumps(trip, indent=2)
print json_data