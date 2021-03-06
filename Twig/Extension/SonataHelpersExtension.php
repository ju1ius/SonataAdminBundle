<?php

/*
 * This file is part of the Sonata Project package.
 *
 * (c) Thomas Rabaix <thomas.rabaix@sonata-project.org>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Sonata\AdminBundle\Twig\Extension;

/**
 * @author ju1ius
 */
class SonataHelpersExtension extends \Twig_Extension
{
    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'sonata_helpers';
    }

    /**
     * {@inheritdoc}
     */
    public function getFunctions()
    {
        return array(
            new \Twig_SimpleFunction(
                'classlist',
                array($this, 'renderClassList'),
                array('is_safe' => array('html_attr'))
            ),
        );
    }

    /**
     * A simple utility for conditionally joining classNames together.
     *
     * Takes any number of arguments which can be string(-like) or array(-like).
     * An argument 'foo' is short for ['foo' => true].
     * If the key is an integer, the value will be used.
     * If the value of the key is falsy, it won't be included in the output.
     *
     * <code>
     * {{ classlist('foo', 'bar') }} {# => 'foo bar' #}
     * {{ classlist('foo', {bar: true}) }} {# => 'foo bar' #}
     * {{ classlist(['foo', 'bar'], {baz: true}) }} {# => 'foo bar baz' #}
     *
     * {# other falsy or non string-like values are just ignored #}
     * {{ classlist(null, false, 'bar', 0, 1, {baz: null}, '') }} {# => 'bar' #}
     *
     * {# arrays are recursively flattened #}
     * {{ classlist(['foo', ['bar', ['baz', 'qux']]]) }} {# => 'foo bar baz qux' #}
     * {{ classlist({foo: {bar: {baz: true}}}) }} {# => 'baz' #}
     * {{ classlist(['foo', {nope: ['bar', 'baz']}]) }} {# => 'foo bar baz' #}
     * </code>
     *
     * @param mixed $arguments,...
     *
     * @return string
     */
    public function renderClassList($arguments)
    {
        $classes = array();
        foreach (func_get_args() as $arg) {
            if (is_array($arg) || $arg instanceof \Traversable) {
                $classes = array_merge($classes, $this->flattenClasslist($arg));
            } elseif ($arg) {
                $classes = array_merge($classes, $this->flattenClasslist(array($arg)));
            }
        }

        return implode(' ', array_keys(array_filter($classes)));
    }

    /**
     * @param array|\Traversable $iterable
     *
     * @return array
     */
    private function flattenClasslist($iterable)
    {
        $classes = array();
        foreach ($iterable as $key => $value) {
            if (is_array($value) || $value instanceof \Traversable) {
                $classes = array_merge($classes, $this->flattenClasslist($value));
            } elseif (is_int($key) && (is_string($value) || method_exists($value, '__toString'))) {
                $classes[(string) $value] = true;
            } elseif (is_string($key)) {
                $classes[$key] = (bool) $value;
            }
        }

        return $classes;
    }
}
