class AddPublicIdToRaffles < ActiveRecord::Migration[7.1]
  def change
    add_column :raffles, :public_id, :string
    add_index :raffles, :public_id
  end
end
