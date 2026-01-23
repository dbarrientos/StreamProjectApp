class CreateRaffles < ActiveRecord::Migration[7.1]
  def change
    create_table :raffles do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title
      t.json :participants
      t.string :status

      t.timestamps
    end
  end
end
