package marubinotto.piggydb.presentation.page.html;

import marubinotto.piggydb.presentation.page.ModelFactory;

public abstract class AbstractHtml extends ModelFactory {
	
	// Disable redirect to return an empty response when a session is expired
	@Override
	public String getRedirect() {
		return null;
	}

	@Override 
	public void onRender() {
		super.onRender();
		disableClientCaching();
	}
}
