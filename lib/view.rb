class View
  @bindings = []
  
  def self.bindings(*bindings)
    @bindings + bindings
  end
  
  def initialzie(name, bindings)
    @name = name
    bindings.each do |attribute,path|
      Binding.new(self,attribute,path)
    end
  end
end