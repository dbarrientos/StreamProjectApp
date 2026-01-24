class SessionsController < ApplicationController
  def create
    user = User.from_omniauth(request.env['omniauth.auth'])
    session[:user_id] = user.id
    
    # In a real production app, return a JWT token here.
    # For this prototype, we redirect with params.
    redirect_to "https://localhost:5173/auth/callback?uid=#{user.uid}&username=#{user.username}&image=#{user.image}&token=#{user.token}&theme=#{user.theme}&language=#{user.language}", allow_other_host: true
  end

  def failure
    redirect_to "https://localhost:5173?error=auth_failed", allow_other_host: true
  end
end
