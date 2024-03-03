import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import * as OneSignal from 'https://esm.sh/@onesignal/node-onesignal@1.0.0-beta7';

// Retrieve environment variables
const _OnesignalAppId_ = Deno.env.get('ONESIGNAL_APP_ID')!;
const _OnesignalUserAuthKey_ = Deno.env.get('USER_AUTH_KEY')!;
const _OnesignalRestApiKey_ = Deno.env.get('ONESIGNAL_REST_API_KEY')!;

// Create OneSignal configuration
const configuration = OneSignal.createConfiguration({
  userKey: _OnesignalUserAuthKey_,
  appKey: _OnesignalRestApiKey_,
});
const onesignal = new OneSignal.DefaultApi(configuration);

// Define the server
serve(async (req) => {
  try {
    // Parse JSON payload from request
    const { record } = await req.json();

    console.log("Received request:", req.method, req.url);
    console.log("Received record:", record);

    // Check if the user spent $200 or more
    if (record.price >= 200) {
      console.log("User spent $200 or more. Sending notification...");

      // Build OneSignal notification object for spending $200 or more
      const notification = new OneSignal.Notification();
      notification.app_id = _OnesignalAppId_;
      notification.include_external_user_ids = [record.user_id];
      notification.contents = {
        en: `You just spent $${record.price}!`,
      };
      console.log("Constructed OneSignal notification:", notification);

      const onesignalApiRes = await onesignal.createNotification(notification);
      console.log("OneSignal API Response:", onesignalApiRes);

      // Respond with success message and OneSignal API response
      return new Response(
        JSON.stringify({ onesignalResponse: onesignalApiRes }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } else {
      console.log("User spent less than $200. Sending notification...");

      // Build OneSignal notification object for spending less than $200
      const notification = new OneSignal.Notification();
      notification.app_id = _OnesignalAppId_;
      notification.include_external_user_ids = [record.user_id];
      notification.contents = {
        en: `Hi there! You spent $${record.price} and you are $${record.user_id}.`,
      };
      console.log("Constructed OneSignal notification:", notification);

      const onesignalApiRes = await onesignal.createNotification(notification);
      console.log("OneSignal API Response:", onesignalApiRes);

      // Respond with success message and OneSignal API response
      return new Response(
        JSON.stringify({ onesignalResponse: onesignalApiRes }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (err) {
    // Handle errors
    console.error('Failed to create OneSignal notification', err);
    return new Response('Server error.', {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
