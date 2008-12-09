module KeyValueObserving
  attr_accessor :bindings
  
  def self.included(base)
    base.extend(ClassMethods)
    base.extend(SharedMethods)
  end

  module SharedMethods
    def did_change_value_for(attribute)
      bindings_for(attribute).each do |binding|
        binding.object.send("#{binding.attribute}=", binding.key_path.target_property)
      end
    end
  end
  include SharedMethods
  
  module ClassMethods
    def kvc_accessor(*accessors)
      accessors.each do |accessor|
        define_method accessor do
          instance_variable_get "@#{accessor}"
        end
        define_method :"#{accessor}=" do |value|
          instance_variable_set "@#{accessor}", value
          did_change_value_for(accessor.to_s)
        end
      end
    end
  end
end