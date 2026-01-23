class TwitchController < ApplicationController
  before_action :authenticate_user!

  def chatters
    service = TwitchService.new(current_user)
    chatters = service.get_chatters
    render json: { chatters: chatters }
  end

  def subscribers
    service = TwitchService.new(current_user)
    subs = service.get_subscribers(params[:broadcaster_id])
    render json: { subscribers: subs }
  end

  def followers
    service = TwitchService.new(current_user)
    followers = service.get_followers(params[:broadcaster_id])
    render json: { followers: followers }
  end

  def moderated_channels
    service = TwitchService.new(current_user)
    channels = service.get_moderated_channels
    render json: { channels: channels }
  end
end
