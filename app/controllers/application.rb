class ApplicationController
  def notes
    will_change_value_for(:notes)
    @notes ||= Note.all
    did_change_value_for(:notes)
  end
end