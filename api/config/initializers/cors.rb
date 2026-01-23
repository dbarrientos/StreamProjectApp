Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "https://localhost:5173", "https://127.0.0.1:5173", /https:\/\/localhost:\d+/

    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true
  end
end
