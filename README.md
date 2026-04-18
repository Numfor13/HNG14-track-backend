# Profile Classification API

## Endpoints

POST /api/profiles
GET /api/profiles/{id}
GET /api/profiles
DELETE /api/profiles/{id}


## Description

This API takes a name, calls the Genderize, Agify, and Nationalize APIs, processes the data, stores the result in a database, and returns structured profile information.

## Example

POST /api/profiles

Request Body:
{
"name": "ella"
}

## Success Response (201)

{
"status": "success",
"data": {
"id": "uuid",
"name": "ella",
"gender": "female",
"gender_probability": 0.99,
"sample_size": 1234,
"age": 46,
"age_group": "adult",
"country_id": "DRC",
"country_probability": 0.85,
"created_at": "2026-04-01T12:00:00Z"
}
}

## Duplicate Response (200)

{
"status": "success",
"message": "Profile already exists",
"data": { }
}

## Get Single Profile

GET /api/profiles/{id}

Response:
{
"status": "success",
"data": { }
}

## Get All Profiles

GET /api/profiles

Optional filters:
gender, country_id, age_group

Example:
/api/profiles?gender=male&country_id=NG

Response:
{
"status": "success",
"count": 2,
"data": [ ]
}

## Delete Profile

DELETE /api/profiles/{id}

Response:
204 No Content

## Error Response

{
"status": "error",
"message": "Error message"
}

## Notes

- Prevents duplicate profiles
- Uses external APIs for data
- Stores results in a database
- Applies age group classification
- Selects country with highest probability
- All timestamps are in UTC (ISO 8601)
