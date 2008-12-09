module Bindable
  def self.included(base)
    base.extend(SharedMethods)
  end
  attr_accessor :bindings
  
  module SharedMethods
    def bind(attribute,path)
      binding = Ribbon.new(self,attribute,path)
      self.send("#{attribute}=", binding.key_path.target_property)
      return binding
    end

    def bindings
      @bindings
    end
    
    def bindings_for(attribute)
      @bindings ||= {}
      @bindings[attribute] || []
    end

    def add_binding_for_attribute(binding,attribute)
      @bindings ||= {}
      @bindings[attribute] ? @bindings[attribute] << binding : @bindings[attribute] = [binding]
    end
  end
  include SharedMethods
end