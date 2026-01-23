class UsersController < ApplicationController
  before_action :authenticate_user!

  def update
    # Ensure user can only update themselves
    unless current_user.uid == params[:id] || current_user.id.to_s == params[:id]
      return render json: { error: "Unauthorized" }, status: :forbidden
    end

    if current_user.update(user_params)
      render json: current_user
    else
      render json: { error: current_user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(:theme, :language)
  end
end
