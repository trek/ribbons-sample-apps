class Binding
  def initialize(object, attribute, key_path, transformer=nil)
    @object = object
    @attribute = attribute
    @key_path = KeyPath.new(key_path)
    @transformer =  transformer
  end
end