require 'net/http'
require 'json'

class TwitchService
  BASE_URL = 'https://api.twitch.tv/helix'

  def initialize(user)
    @user = user
    @client_id = ENV['TWITCH_CLIENT_ID']
  end

  def get_chatters
    url = "#{BASE_URL}/chat/chatters?broadcaster_id=#{@user.uid}&moderator_id=#{@user.uid}&first=100"
    response = request(:get, url)
    
    if response.is_a?(Net::HTTPSuccess)
      data = JSON.parse(response.body)
      data['data'].map { |chatter| { username: chatter['user_name'], type: 'viewer' } }
    else
      Rails.logger.error "Twitch API Error (Chatters): #{response.body}"
      []
    end
  end

  def get_subscribers(broadcaster_id = nil)
    target_id = broadcaster_id || @user.uid
    url = "#{BASE_URL}/subscriptions?broadcaster_id=#{target_id}&first=100"
    
    puts "Twitch API Request (Subs): #{url}"
    response = request(:get, url)
    puts "Twitch API Response Code (Subs): #{response.code}"
    
    if response.is_a?(Net::HTTPSuccess)
      data = JSON.parse(response.body)
      data['data'].map { |sub| { username: sub['user_name'], type: 'subscriber', tier: sub['tier'] } }
    else
      Rails.logger.error "Twitch API Error (Subs): #{response.body}"
      []
    end
  end

  def get_followers(broadcaster_id = nil)
    target_id = broadcaster_id || @user.uid
    # If checking another channel, we act as moderator
    # If checking own channel, we act as broadcaster (which is implied mod)
    
    url = "#{BASE_URL}/channels/followers?broadcaster_id=#{target_id}&first=100"
    # Note: moderator_id is required if we want to see private info, but for public follower list, 
    # broadly speaking just broadcaster_id is enough for public list? 
    # Actually checking docs: "This endpoint returns a list of users who follow the specified broadcaster."
    # moderator_id is optional but required to read 'user_id' if scope is specific? 
    # Actually, let's keep it simple. If we are mod, passing moderator_id might help with rate limits or specific scopes.
    url += "&moderator_id=#{@user.uid}" if broadcaster_id && broadcaster_id != @user.uid
    
    puts "Twitch API Request: #{url}"
    response = request(:get, url)
    puts "Twitch API Response Code: #{response.code}"
    # puts "Twitch API Response Body: #{response.body}"
    
    if response.is_a?(Net::HTTPSuccess)
      data = JSON.parse(response.body)
      # Map correctly based on API response structure
      data['data'].map do |follower| 
        { 
          username: follower['user_name'], 
          type: 'follower',
          followed_at: follower['followed_at']
        } 
      end
    else
      Rails.logger.error "Twitch API Error (Followers): #{response.body}"
      []
    end
  end

  def get_moderated_channels
    url = "#{BASE_URL}/moderation/channels?user_id=#{@user.uid}"
    puts "DEBUG: Fetching Moderated Channels from: #{url}"
    response = request(:get, url)
    puts "DEBUG: Twitch Response Code: #{response.code}"
    puts "DEBUG: Twitch Response Body: #{response.body}"
    
    if response.is_a?(Net::HTTPSuccess)
      data = JSON.parse(response.body)
      data['data'].map { |channel| { 
        id: channel['broadcaster_id'],
        username: channel['broadcaster_name'],
        login: channel['broadcaster_login'] 
      } }
    else
      Rails.logger.error "Twitch API Error (Moderated Channels): #{response.body}"
      []
    end
  end

  private

  def request(method, url)
    uri = URI(url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    req = Net::HTTP::Get.new(uri)
    req['Authorization'] = "Bearer #{@user.token}"
    req['Client-Id'] = @client_id
    
    http.request(req)
  end
end
