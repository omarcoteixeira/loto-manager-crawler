install:
	npm i --prefix functions
audit:
	npm audit --prefix functions
fix:
	npm audit fix --prefix functions
fund:
	npm fund --prefix functions
upgrade:
	npm upgrade --prefix functions
deploy:
	firebase deploy --only functions