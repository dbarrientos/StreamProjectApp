class AddPreferencesToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :theme, :string, default: 'dark'
    add_column :users, :language, :string, default: 'es'
  end
end
