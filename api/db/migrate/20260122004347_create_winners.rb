class CreateWinners < ActiveRecord::Migration[7.1]
  def change
    create_table :winners do |t|
      t.references :raffle, null: false, foreign_key: true
      t.string :username
      t.string :status
      t.datetime :claimed_at

      t.timestamps
    end
  end
end
