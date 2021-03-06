package org.molgenis.data.security.exception;

import org.molgenis.i18n.CodedRuntimeException;

public class NullParentPackageNotSuException extends CodedRuntimeException
{
	private static final String ERROR_CODE = "DS03";

	public NullParentPackageNotSuException()
	{
		super(ERROR_CODE);
	}

	@Override
	protected Object[] getLocalizedMessageArguments()
	{
		return new String[] {};
	}
}
