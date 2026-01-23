class User < ApplicationRecord
  has_many :raffles, dependent: :destroy

  def self.from_omniauth(auth)
    user = where(provider: auth.provider, uid: auth.uid).first_or_initialize
    user.email = auth.info.email
    user.username = auth.info.name
    user.image = auth.info.image
    user.token = auth.credentials.token
    # user.secret = auth.credentials.secret
    user.save!
    user
  end
end
