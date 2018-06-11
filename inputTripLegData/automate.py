import googlemaps
from datetime import datetime

def finddist(source,destination):
    gmaps = googlemaps.Client(key='AIzaSyD_sAu7TZJWzrmMi1SygxEG3Smdp3Ihb0A')
    now = datetime.now()
    directions_result = gmaps.directions(source,destination,mode="driving", deparure_time=now)
    for map1 in directions_result:
        overall_stats= map1['legs']
        for dimensions in overall_stats:
            distance = dimensions['distance']
            return [distance['text']]

def findtime(source,destination):
    gmaps = googlemaps.Client(key='AIzaSyD_sAu7TZJWzrmMi1SygxEG3Smdp3Ihb0A')
    now = datetime.now()
    directions_result = gmaps.directions(source,destination,mode="driving", deparure_time=now)
    for map1 in directions_result:
        overall_stats= map1['legs']
        for dimensions in overall_stats:
            duration = dimensions['duration']
            return [duration['text']]
