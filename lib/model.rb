class Model
  def self.all(page=0, offset=nil)
    @request = Request.new({:url => @data_source})
  end
  
  def self.data_source(url)
    @data_source = url
  end
  
  def self.data_format(format)
    @data_format = format
  end
end