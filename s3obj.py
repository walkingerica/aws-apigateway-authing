import json
import urllib.parse
import boto3
import os

print('Loading function')

s3 = boto3.resource('s3')


def lambda_handler(event, context):
    #print("Received event: " + json.dumps(event, indent=2))

    # Get the object from the event and show its content type
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
    try:
        response = s3.Object(bucket, key).get()
        print("CONTENT TYPE: " + response['ContentType'])
        ep = boto3.client("s3").meta.endpoint_url
        ep = urllib.parse.urlparse(ep).hostname
        redirect_url = 'http://' + bucket + '.' + ep.replace("s3", "s3-website")
        print("environment variable PRIVATE_URL: " + os.environ['PRIVATE_URL'])
        print("environment variable PUBLIC_URL: " + os.environ['PUBLIC_URL'])
        print("environment variable AUTH_ID: " + os.environ['AUTH_ID'])
        print("environment variable AUTH_URL: " + os.environ['AUTH_URL'])
        print("environment variable AUTH_KEY: " + os.environ['AUTH_KEY'])
        print("environment variable AUTH_KEY: " + os.environ['AUTH_KEY'])
        print("S3 static website endpoint: " + redirect_url)
        app_js_data = response["Body"].read().decode('utf-8')

        if "http://localhost" in app_js_data:
          print("Begin modify the endpoints##########")
          app_js_data = app_js_data.replace("http://localhost:3000/dev/api/public", os.environ['PUBLIC_URL'])
          app_js_data = app_js_data.replace("http://localhost:3000/dev/api/private", os.environ['PRIVATE_URL'])
          app_js_data = app_js_data.replace("AUTH_IDxxxx", os.environ['AUTH_ID'])
          app_js_data = app_js_data.replace("AUTH_URLxxxx", os.environ['AUTH_URL'])
          app_js_data = app_js_data.replace("AUTH_KEYxxxx", os.environ['AUTH_KEY'])
          app_js_data = app_js_data.replace("http://localhost:8000", redirect_url)

          app_js_new = s3.Object(bucket,'app.js')
          app_js_new.put(Body=app_js_data, ACL='public-read')
          print("End modify the endpoints##########")
        else:
          print("There are no Endpoits need modify!!!")

        return response['ContentType']
    except Exception as e:
        print(e)
        print('Error modify object {} from bucket {}.'.format(key, bucket))
        raise e
