Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Auth Routes
  get '/auth/:provider/callback', to: 'sessions#create'
  get '/auth/failure', to: 'sessions#failure'

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check

  resources :users, only: [:update]

  resources :raffles do
    member do
      post :register_winner
    end
  end

  get 'twitch/chatters', to: 'twitch#chatters'
  get 'twitch/subscribers', to: 'twitch#subscribers'
  get 'twitch/chatters', to: 'twitch#chatters'
  get 'twitch/subscribers', to: 'twitch#subscribers'
  get 'twitch/followers', to: 'twitch#followers'
  get 'twitch/moderated_channels', to: 'twitch#moderated_channels'

  # Public Routes
  get 'api/public/raffles/:public_id', to: 'public_raffles#show'
end
