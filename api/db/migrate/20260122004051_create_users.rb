class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users do |t|
      t.string :uid
      t.string :provider
      t.string :email
      t.string :username
      t.string :image
      t.string :token

      t.timestamps
    end
  end
end
