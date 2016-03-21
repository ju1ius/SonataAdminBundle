cs:
	php-cs-fixer fix --verbose
	npm run lint -- --fix

cs_dry_run:
	php-cs-fixer fix --verbose --dry-run
	npm run lint

test: phpunit docs

docs:
	cd Resources/doc && sphinx-build -W -b html -d _build/doctrees . _build/html

phpunit:
	phpunit

bower:
	bower update
