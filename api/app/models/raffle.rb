require 'securerandom'

class Raffle < ApplicationRecord
  belongs_to :user
  has_many :winners, dependent: :destroy

  # SQLite stores JSON as text, but Rails handles the serialization.
  # If using Postgres in prod, this behaves as JSONB if migrated correctly.
  
  enum status: { created: 'created', active: 'active', spinning: 'spinning', completed: 'completed', cancelled: 'cancelled' }

  validates :title, presence: true
  before_create :generate_public_id

  private

  def generate_public_id
    self.public_id ||= SecureRandom.uuid
  end
end

