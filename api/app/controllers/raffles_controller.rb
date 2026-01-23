class RafflesController < ApplicationController
  before_action :authenticate_user!
  
  def index
    render json: current_user.raffles.order(created_at: :desc), include: :winners
  end

  def create
    raffle = current_user.raffles.new(raffle_params)
    
    if raffle.save
      render json: raffle, status: :created
    else
      render json: raffle.errors, status: :unprocessable_entity
    end
  end

  def update
    raffle = current_user.raffles.find(params[:id])
    if raffle.update(raffle_params)
      render json: raffle
    else
      render json: raffle.errors, status: :unprocessable_entity
    end
  end

  def show
    raffle = current_user.raffles.find(params[:id])
    render json: raffle, include: :winners
  end

  # We use this to register a winner (or al_agua result)
  def register_winner
    raffle = current_user.raffles.find(params[:id])
    
    # We now allow multiple results per raffle
    
    winner = raffle.winners.build(winner_params)
    
    if winner.save
      # Mark raffle completed only if it's a real winner
      raffle.completed! if winner.won?
      render json: winner, status: :created
    else
      render json: winner.errors, status: :unprocessable_entity
    end
  end

  private

  def raffle_params
    params.require(:raffle).permit(:title, :status, participants: [])
  end

  def winner_params
    params.require(:winner).permit(:username, :status, :claimed_at)
  end
end
