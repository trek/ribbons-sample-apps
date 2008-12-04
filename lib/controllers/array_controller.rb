class ArrayController
  def self.contents(key_path)
    KeyPath.new(key_path)
  end
end