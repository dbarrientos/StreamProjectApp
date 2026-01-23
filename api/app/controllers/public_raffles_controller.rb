class PublicRafflesController < ApplicationController
  # Public endpoint, no auth required (and none inferred from ApplicationController)
  
  def show
    puts "DEBUG: PublicRafflesController#show params: #{params.inspect}"
    raffle = Raffle.find_by(public_id: params[:public_id])
    puts "DEBUG: Found raffle: #{raffle.inspect}"

    unless raffle
        puts "DEBUG: Raffle NOT found for public_id: #{params[:public_id]}"
        render json: { error: 'Raffle not found' }, status: :not_found
        return
    end
    winners = raffle.winners.where(status: 'won').select(:username, :status, :claimed_at)
    latest_winner = raffle.winners.order(created_at: :desc).first
    
    render json: {
      title: raffle.title,
      status: raffle.status,
      created_at: raffle.created_at,
      participants: raffle.participants,
      winners: winners,
      latest_winner: latest_winner ? { username: latest_winner.username, status: latest_winner.status, claimed_at: latest_winner.claimed_at } : nil,
      host: {
        username: raffle.user.username,
        image: raffle.user.image
      }
    }
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Raffle not found' }, status: :not_found
  end
end
