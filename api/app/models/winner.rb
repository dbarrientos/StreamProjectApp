class Winner < ApplicationRecord
  belongs_to :raffle

  enum status: { won: 'won', lost: 'lost', al_agua: 'al_agua', pending_reveal: 'pending_reveal', waiting_claim: 'waiting_claim' }

  validates :username, presence: true
end
