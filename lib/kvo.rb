module KVO
  module ClassMethods
    def kvc_accessor(*methods)
      methods.each do |method|
        define_method method do
          instance_variable_get "@{method}"
        end
        
        define_method :"#{method}=" do |value|
          will_change_value_for(method)
          instance_variable_set "@{method}", value
          did_change_value_for(method)
        end
      end
    end
  end
  
  module InstanceMethods
    def will_change_value_for(key)
      
    end
    
    def did_change_value_for(key)
      
    end
  end
end

