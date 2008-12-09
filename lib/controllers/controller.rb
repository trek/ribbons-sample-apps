class Controller
  include KeyValueObserving
  include Bindable
  def self.kvc_accessor(*accessors)
    accessors.each do |accessor|
      define_method accessor do
        instance_variable_get "@#{accessor}"
      end
      define_method :"#{accessor}=" do |value|
        instance_variable_set "@#{accessor}", value
        did_change_value_for(accessor.to_s)
      end
      m = Module.new
      m.instance_eval do
        define_method accessor do
          self.shared_instance.send(accessor)
        end
        
        define_method :"#{accessor}=" do |value|
          self.shared_instance.send(:"#{accessor}=", value)
          did_change_value_for(accessor.to_s)
        end
      end
      self.extend(m)
    end
  end
  
  def self.outlet(*accessors)
    @outlets ?  @outlets + accessors : @outlets = accessors
    accessors.each do |accessor|
      define_method accessor do
        instance_variable_get "@#{accessor}"
      end
      define_method :"#{accessor}=" do |value|
        instance_variable_set "@#{accessor}", value
      end
      m = Module.new
      m.instance_eval do
        define_method accessor do
          self.shared_instance.send(accessor)
        end
        
        define_method :"#{accessor}=" do |value|
          self.shared_instance.send(:"#{accessor}=", value)
        end
      end
      self.extend(m)
    end
  end
  
  def self.outlets
    @outlets
  end
    
  def self.shared_instance
    @arranged_objects = ArrangedObjects.new
    @shared_instance ||= self.new
  end
end