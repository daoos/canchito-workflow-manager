<?php
/**
 * This content is released under the MIT License (MIT)
 *
 * Copyright (c) 2016, canchito-dev
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 * @author 		Jose Carlos Mendoza Prego
 * @copyright	Copyright (c) 2016, canchito-dev (http://www.canchito-dev.com)
 * @license		http://opensource.org/licenses/MIT	MIT License
 * @link		https://github.com/canchito-dev/mini-framework-mvc
 */
namespace Application\Libs\Form\Elements;

/**
 * Lets you generate a standard password input field
 * @param array $attributes - an array of attributes used to configure the input field
 **/
class Password extends BaseElement {
	
	private $toggle;
	private $placement;
	private $message;
	
	public function __construct() {}
	
	public function __destruct() {}
	
	public function create($attributes = array())  {
		$attributes['type'] = 'password';
		parent::create($attributes);
		$this->configure();
	}
	
	public function setToggle($toggle = null) {
		$this->toggle = $toggle;
	}
	public function getToggle() {
		return $this->toggle;
	}
	public function getHtmlToggle() {
		if ($this->toggle != null)
			return 'data-toggle="password"';
		return '';
	}
	
	public function setPlacement($placement = null) {
		$this->placement = $placement;
	}
	public function getPlacement() {
		return $this->placement;
	}
	public function getHtmlPlacement() {
		return 'data-placement="' . $this->placement . '"';
	}
	
	public function setMessage($message = null) {
		$this->message = $message;
	}
	public function getMessage() {
		return $this->message;
	}
	public function getHtmlMessage() {
		return 'data-message="' . $this->message . '"';
	}
}