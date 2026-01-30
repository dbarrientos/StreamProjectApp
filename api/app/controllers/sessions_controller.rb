class SessionsController < ApplicationController
  def create
    user = User.from_omniauth(request.env['omniauth.auth'])
    session[:user_id] = user.id
    Rails.logger.info "LOGIN_DEBUG: Session created for user #{user.id} (#{user.username}). Session ID: #{session.id.inspect}"

    
    # In a real production app, return a JWT token here.
    # For this prototype, we redirect with params.
    frontend_url = ENV.fetch('FRONTEND_URL', 'https://localhost:5173')
    
    # Log the cookie we are trying to set
    Rails.logger.info "LOGIN_DEBUG: Response Set-Cookie: #{response.headers['Set-Cookie']}"
    
    redirect_to "#{frontend_url}/auth/callback?uid=#{user.uid}&username=#{user.username}&image=#{user.image}&token=#{user.token}&theme=#{user.theme}&language=#{user.language}", allow_other_host: true

  end

  def failure
    frontend_url = ENV.fetch('FRONTEND_URL', 'https://localhost:5173')
    redirect_to "#{frontend_url}?error=auth_failed", allow_other_host: true
  end
end
