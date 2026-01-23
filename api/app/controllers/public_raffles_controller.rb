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
    
    render json: {
      title: raffle.title,
      created_at: raffle.created_at,
      winners: winners,
      host: {
        username: raffle.user.username,
        image: raffle.user.image
      }
    }
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Raffle not found' }, status: :not_found
  end
end
