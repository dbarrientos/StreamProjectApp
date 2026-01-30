class ApplicationController < ActionController::API
  include ActionController::Cookies

  def current_user
    @current_user ||= User.find(session[:user_id]) if session[:user_id]
  rescue ActiveRecord::RecordNotFound
    session[:user_id] = nil
  end

  def authenticate_user!
    Rails.logger.info "AUTH_DEBUG: Authenticating... Session ID: #{session.id.inspect}, User ID: #{session[:user_id].inspect}"
    render json: { error: 'Not authorized' }, status: :unauthorized unless current_user
  end

end
