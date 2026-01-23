Rails.application.config.middleware.use OmniAuth::Builder do
  provider :twitch, ENV['TWITCH_CLIENT_ID'], ENV['TWITCH_CLIENT_SECRET'],
    redirect_uri: ENV['TWITCH_REDIRECT_URI'] || 'http://localhost:3000/auth/twitch/callback',
    scope: 'user:read:email moderator:read:chatters channel:read:subscriptions moderator:read:followers user:read:moderated_channels'
end

OmniAuth.config.allowed_request_methods = %i[post get]
