class ApplicationController < ActionController::API
  include ActionController::Cookies

  def current_user
    return @current_user if defined?(@current_user)

    if session[:user_id]
      @current_user = User.find_by(id: session[:user_id])
    elsif request.headers['Authorization'].present?
      token = request.headers['Authorization'].split(' ').last
      @current_user = User.find_by(token: token)
      if @current_user
        Rails.logger.info "AUTH_DEBUG: Token auth success for user #{@current_user.id} (#{@current_user.username})"
      else
        Rails.logger.info "AUTH_DEBUG: Token auth failed (invalid token)"
      end
    end

    @current_user
  end


  def authenticate_user!
    Rails.logger.info "AUTH_DEBUG: Authenticating... Session ID: #{session.id.inspect}, User ID: #{session[:user_id].inspect}"
    Rails.logger.info "AUTH_DEBUG: Cookies: #{request.headers['Cookie']}"
    Rails.logger.info "AUTH_DEBUG: Origin: #{request.headers['Origin']}"

    render json: { error: 'Not authorized' }, status: :unauthorized unless current_user
  end

end
