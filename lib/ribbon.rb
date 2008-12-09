class Ribbon
  attr_reader :key_path, :object, :attribute
  def initialize(object, attribute, key_path)
    @object = object
    @attribute = attribute
    @key_path = KeyPath.new(key_path)
    @bound_object = @key_path.target_object
    @bound_property = @key_path.target_property_name
    self.connect
  end
  
  def connect
    @bound_object.add_binding_for_attribute(self,@bound_property)
  end
end
