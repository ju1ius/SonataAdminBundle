<?php

/*
 * This file is part of the Sonata Project package.
 *
 * (c) Thomas Rabaix <thomas.rabaix@sonata-project.org>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Sonata\AdminBundle\Tests\Twig;

/**
 * @author ju1ius
 */
class HTMLTestCase extends \PHPUnit_Framework_TestCase
{
    /**
     * Asserts that two HTML strings are equal by comparing their DOM.
     *
     * @param string $expected
     * @param string $actual
     * @param string $message
     */
    protected function assertHTMLEquals($expected, $actual, $message = '')
    {
        $expectedDoc = self::getHTMLDocument($expected);
        $actualDoc = self::getHTMLDocument($actual);

        $this->assertHTMLElementEquals(
            $expectedDoc->getElementsByTagName('body')->item(0),
            $actualDoc->getElementsByTagName('body')->item(0),
            $message
        );
    }

    /**
     * Asserts that two HTML elements are deeply equal, because
     * PHPUnit's `assertEqualXMLStructure` doesn't compare attribute & node values...
     *
     * Attributes names & values are checked (order doesn't matter).
     * Empty text nodes, comments, CDATA sections are skipped.
     * Whitespace is normalized.
     *
     * @param \DOMElement $expected
     * @param \DOMElement $actual
     * @param string      $message
     */
    protected function assertHTMLElementEquals(\DOMElement $expected, \DOMElement $actual, $message = '')
    {
        if ($message) {
            $message .= "\n";
        }
        $this->assertSame($expected->tagName, $actual->tagName, sprintf(
            "%sTag name doesn't match",
            $message
        ));
        $this->assertSame($expected->attributes->length, $actual->attributes->length, sprintf(
            '%sNumber of attributes differ on element <%s>',
            $message,
            $expected->tagName
        ));

        /** @var \DOMAttr $attribute */
        foreach ($expected->attributes as $attribute) {
            if (!$actual->hasAttribute($attribute->name)) {
                $this->fail(sprintf(
                    '%sAttribute "%s" not found on element <%s>',
                    $message,
                    $attribute->name,
                    $expected->tagName
                ));
            }
            $this->assertSame($attribute->value, $actual->getAttribute($attribute->name), sprintf(
                '%sAttribute value for <%s %s="..."> differ.',
                $message,
                $expected->tagName,
                $attribute->name
            ));
        }

        self::removeEmptyNodes($expected);
        self::removeEmptyNodes($actual);

        $this->assertSame($expected->childNodes->length, $actual->childNodes->length, sprintf(
            '%sNumber of child nodes differ on element <%s>',
            $message,
            $expected->tagName
        ));

        foreach ($expected->childNodes as $i => $expectedChild) {
            $actualChild = $actual->childNodes->item($i);
            $this->assertSame($expectedChild->nodeType, $actualChild->nodeType, sprintf(
                '%sExpected child node to be of type "%s", got "%s"',
                $message,
                get_class($expectedChild),
                get_class($actualChild)
            ));

            if ($expectedChild instanceof \DOMElement) {
                $this->assertHTMLElementEquals($expectedChild, $actualChild);
            } elseif ($expectedChild instanceof \DOMText) {
                $this->assertSame(trim($expectedChild->nodeValue), trim($actualChild->nodeValue), sprintf(
                    "%sText node value doesn't match in element <%s>.",
                    $message,
                    $expected->tagName
                ));
            }
        }
    }

    /**
     * @param string $html
     *
     * @return \DOMDocument
     */
    private static function getHTMLDocument($html)
    {
        $html = preg_replace('/\s+/', ' ', $html);
        $dom = new \DOMDocument();
        $html = '<?xml encoding="UTF-8">'.$html;

        libxml_use_internal_errors(true);
        $dom->loadHTML($html);
        // remove empty & merge adjacent text nodes.
        $dom->normalizeDocument();
        libxml_clear_errors();
        libxml_use_internal_errors(false);

        return $dom;
    }

    /**
     * Removes empty text nodes & all other character data (comments, CDATA, etc...).
     *
     * @param \DOMNode $node
     */
    private static function removeEmptyNodes(\DOMNode $node)
    {
        for ($i = $node->childNodes->length - 1; $i >= 0; --$i) {
            $child = $node->childNodes->item($i);
            if ($child instanceof \DOMText) {
                $text = trim($child->nodeValue);
                if (!$text) {
                    $node->removeChild($child);
                }
            } elseif ($child instanceof \DOMCharacterData) {
                $node->removeChild($child);
            }
        }
    }
}
