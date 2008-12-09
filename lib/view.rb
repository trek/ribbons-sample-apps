class View
  include KeyValueObserving
  include Bindable
  kvc_accessor :data_source
  
  def initialize(options={:bind => {}})
    options[:bind].each do |property,path|
      bind property, path
    end
    
    KeyPath.step_through_with_assignment(options[:outlet].split('.'),self) if options[:outlet]
  end
  
  def did_change_value_for(attribute)
    redraw
  end
  
  def redraw
   
  end
end