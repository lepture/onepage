
build: components index.js onepage.css
	@component build --dev

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

gh-pages: components
	@component build
	@rm -fr gh-pages
	@mkdir gh-pages
	@mv build gh-pages/
	@cp index.html gh-pages/
	@ghp-import gh-pages -p
	@rm -fr gh-pages

.PHONY: clean gh-pages build components
