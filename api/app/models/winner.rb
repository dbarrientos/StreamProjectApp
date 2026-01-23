class Winner < ApplicationRecord
  belongs_to :raffle

  enum status: { won: 'won', lost: 'lost', al_agua: 'al_agua' }

  validates :username, presence: true
end
