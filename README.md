## Schema

The didbot schema is as follows:

```json
{
    "type": "did",
    "text": "I am happily creating some sample dids",
    "tags": [
      "tag 1",
      "tag 2"
    ],
    "source": "mobile",
    "user": "pupshaw",
    "meta": {
        "url": "http://www.dictionary.com/browse/url",
        "location": "Los Angeles, CA",
        "geo": "34.052235, -118.243683",
        "miles": 12.4,
        "hours": 8.6
    },
    "date": "2017-07-05T21:44:26.580Z",
    "_id": "2017-01-03T13:00:00.000Z",
    "_rev": "1-58eaaac53f91ee84f072c7d9e148b5ae"
}
```

### Meta

The meta field is an object of optional key value pairs. The value
belonging to each key must either be a string, number, or boolean. 
Note that the value of these fields are not intended to be searched. 

You can add any meta key you want and they will be enumerated when 
viewing a did's details. To prevent abuse meta fields are capped at 5 and 100 characters max.

The intention is to support enhanced display of certain fields on the
front end by analyzing the value regardless of the key name. For example:
- making fully qualified url's click-able
- displaying valid locations and geo coordinates on a map
- in-lining liked images
- charting or aggregating integers/floats

For example, selecting the tag "running" and limiting it to dids in the last week might display
something like miles: 15.43 at the top of the search results. It would do so by aggregating all
the meta values for the search results under their corresponding key.

When creating a did, at least initially, the user will need to enter the key and the value in two
corresponding text inputs. Eventually, the goal is to use natural language processing to parse
the text and automatically create key value pairs. For example: a did with the text Ran 10.3 miles
today in an hour and thirty seven minutes could become 
```json
{
    ...
    "tags": [
      "running"
    ],
    "meta": {
        "miles": 10.3,
        "minutes": 97
    }
    ...
}
```

Similarly it would be a goal to integrate with 3rd party fitness trackers. For example, an entry
copied from Garmin could look like this:

```json
{
    ...
    "source": "garmin",
    "tags": [
      "running"
    ],
    "meta": {
        "miles": 10.3,
        "minutes": 97,
        "calories": 982
    }
    ...
}
```